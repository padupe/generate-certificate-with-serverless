import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";
import * as handlebars from "handlebars";
import { join } from "path";
import { readFileSync } from "fs";
import * as dayjs from "dayjs";

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
    const filePath = join(process.cwd(), "src", "templates", "certificates.hbs");

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

   // Como no Create (PUT) não temos um retorno, vamos consultar se de fato, foi inserido no Banco
   const response = await document.query({
       TableName: "users_certificate",
       KeyConditionExpression: "id = :id",
       ExpressionAttributeValues: {
           ":id": id
       }
   }).promise();

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

    return {
        statusCode: 201,
        body: JSON.stringify(response.Items[0]),
    }
}