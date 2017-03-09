# Payment Service Test

## Technology

- Database: mongodb
- Language & framework: Node.js

## How to use it

### Dependencies

- Node.JS ^0.11
- NPM
- MongoDB
- Mocha (for tests)

### Prepare the environment

    npm install
    
### Defaults

The default settings can be found in the `config.js` file.

They can be overridden with environment variables :

- `PORT=3000`, the default REST API port
- `DB_DOMAIN=localhost`, the default MongoDB domain
- `DB_PORT=27017`, the default MongoDB port

### Run it

#### Node

You must have a running MongoDB server besides.

    node index.js
    
#### With Docker

    # Build the Docker image
    docker build -t payment-service-test:latest .
    
    # Launch the MongoDB server
    docker run -d --name mongo-payment-service-test -p 27017:27017 mongo --smallfiles
    
    # Launch the Payment Service
    docker run -d --name payment-service-test-instance -p 3000:3000 payment-service-test:latest
    
If you want to use a different port or database :

    docker run -d --name payment-service-test-instance -p <port>:3000 -e DB_DOMAIN=<domain> -e DB_PORT=<port> payment-service-test:latest
    
#### Using docker-compose

The configuration can be edited in the `docker-compose.yml` file.

    docker-compose up
    
In detached mode:

    docker-compose up -d
    
## Tests

    npm test
    
or

    mocha --recursive test