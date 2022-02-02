import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";

interface IUserCertificate {
    name: string;
    id: string;
    grade: string;
    created_at: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
    
    const { id } = event.pathParameters;

    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userCertificate = response.Items[0] as IUserCertificate;

    if(userCertificate) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Certificado Válido!",
                name: userCertificate.name,
                id: userCertificate.id,
                grade: userCertificate.grade,
                url: `https://certificate-with-serverless-2022.s3.amazonaws.com/${id}.pdf`,
                created_at: userCertificate.created_at
            })
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Certificado Inválido!"
        })
    }
}