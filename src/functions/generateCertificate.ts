import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";
import handlebars from "handlebars";
import { join } from "path";
import { readFileSync } from "fs";
import dayjs from "dayjs";
import chromium from "chrome-aws-lambda";
import { S3 } from "aws-sdk";

interface ICreateCertificate {
    id: string;
    name: string;
    grade: string;
}

interface ITemplate {
    id: string;
    name: string;
    grade: string;
    date: string;
    medal: string
}

const compileTemplate = async (data: ITemplate) => {
    const filePath = join(process.cwd(), "src", "templates", "certificate.hbs");

    const html = readFileSync(filePath, "utf-8");

    return handlebars.compile(html)(data);
}

export const handler: APIGatewayProxyHandler = async (event) => {
    /*
    Informações que receberemos para gerar o certificado
    - id
    - nome do aluno (name)
    - nota obtida (grade)
    */
   const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

    // Como no Create (PUT) não temos um retorno, vamos consultar se de fato, foi inserido no Banco
    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userAlreadyExists = response.Items[0];

    if(!userAlreadyExists) {
        // para realizar uma inserção no DynamoDB utilizamos PUT
        await document.put({
            TableName: "users_certificate",
            Item: {
                id,
                name,
                grade,
                created_at: new Date().getTime(),
            }
        }).promise();
    }   

    const medalPath = join(process.cwd(), "src", "templates", "selo.png");
    const medal = readFileSync(medalPath, "base64");

    const data: ITemplate = {
       name,
       id,
       grade,
       date: dayjs().format("DD/MM/YYYY"),
       medal,
    }

    const content = await compileTemplate(data);

    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
    });

    const page = await browser.newPage();

    await page.setContent(content);
    const pdf = await page.pdf({
        format: "a4",
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        path: process.env.IS_OFFLINE ? "./certificate.pdf" : null
    })

    await browser.close();

    const s3 = new S3();

    // Código abaixo apenas para criar o Bucket
    // await s3.createBucket({
    //     Bucket: "certificate-with-serverless-2022"
    // }).promise();

    await s3.putObject({
        Bucket:"certificate-with-serverless-2022",
        Key: `${id}.pdf`,
        ACL: "public-read",
        Body: pdf,
        ContentType: "application/pdf"
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Certificado gerado com sucesso!",
            url: `https://certificate-with-serverless-2022.s3.amazonaws.com/${id}.pdf`
        }),
    }
}