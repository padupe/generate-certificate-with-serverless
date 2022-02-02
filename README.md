![img](https://github.com/padupe/generate-certificate-with-serverless/blob/master/Images/generate_certificate.svg)
# Generate Certificate
Aplicação para gerar e validar Certificados

## Diagrama
<div align="center">
        <img align="center" src="https://github.com/padupe/generate-certificate-with-serverless/blob/master/Images/generate-certificate-with-serverless.drawio.png">
</div>

## Requisitos
- [node](https://nodejs.org/en/ 'node'): eventos voltados para o backend (versão >= 14.x);
- [nvm](https://github.com/nvm-sh/nvm 'nvm'): Pacote de versionamento do Node.js;
- [serverless](https://www.serverless.com/ 'serverless'): Framework

## Comandos Úteis
`nvm use`: para rodar a versão do Node.js adequada;
`yarn install`: para instalar as dependências do Projeto;
`yarn dev`: para rodar localmente
`yarn dynamodb:install`: para instalar a extensão do DynamoDB localmente
`yarn dynamodb:start`: para rodar o banco de dados localmente
`yarn deploy`: para realizar o deploy da aplicação.
## Funções

### generateCertificate
Função que cria o Certificado.

#### Descição
- Método **POST**
- Exemplo de payload:
```json
{
	"id": "ae378322-fcfe-4708-8888-d413adb6c3d8",
	"name": "João da Silva",
	"grade": "10.00"
}
```

### validateCertificate
Função que valida um Certificado (pelo id).

#### Descrição
- Método **GET**
- Exemplo de consulta:
`http://localhost:3000/dev/verifyCertificate/ae378322-fcfe-4708-8888-d413adb6c3d8`