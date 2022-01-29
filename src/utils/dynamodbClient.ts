import { DynamoDB } from "aws-sdk";

const options = {
    region: "localhost",
    // 8000 é a porta padrão do DynamoDB
    endpoint: "http://localhost:8000",
    accessKeyId: "x",
    secretAccessKey: "x"
}

const isOffline = () => {
    // Ao instalar o plugin "serverless-offline", a variável de ambiente IS_OFFLINE será setada como TRUE de maneira dinâmica
    // Assim sendo, não há necessidade de se criar um ".env"
    return process.env.IS_OFFLINE
}

// Se o retorno de "isOffline" for TRUE, o DynamoDB deve se conectar localmente, caso contrário na AWS
export const document = isOffline() ? new DynamoDB.DocumentClient(options) : new DynamoDB.DocumentClient();