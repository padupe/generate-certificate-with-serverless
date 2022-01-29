import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";

interface ICreateCertificate {
    id: string;
    name: string;
    grade: string;
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

    return {
        statusCode: 201,
        body: JSON.stringify(response.Items[0]),
    }
}