# Summary

- Expected workflow
- Setup the environment and the cluster
- Setup the Payment Service

# Expected repository/project workflow

- [x] 1. Commit changes on this repository.
- [x] 2. Jenkins do a build every 10 minutes (this is just for debugging` we usually want to build when a push is done)
- [x] 3. Jenkins pulls the changes of this repository
- [x] 4. Jenkins runs tests
- [ ] 5. If the tests are successful and above 80%, Jenkins builds a new image
- [x] 6. If the image is built, Jenkins pushes the image to the private Docker registry (`127.0.0.1:5000`)

This job configuration can be found at `jenkins/jobs/payment-service-jenkins-job.xml` where the Docker workflow is 
explained.

# Setup the environment and the cluster

## Entrypoint

Just run the following command:

    vagrant up
    
If you want to use another provider than VirtualBox:

    vagrant up --provider {provider}
    vagrant up --provider hyperv
    
It will install:

- Docker
- Ansible
- Run an Ansible playbook:
    - Install Jenkins
    - Install Jenkins plugins
    - Pre-configure the job
- Run the Jenkins on the http://{ip}:8080

# Setup the Payment Service (REST API)

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
    
If the environment variable `NODE_ENV` is equal to `production`, only the production packages/dependencies will be 
downloaded.
    
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

With this way you can test our Payment Service REST API easily. You just have to run the following command.

    docker-compose up
    
In detached mode:

    docker-compose up -d
    
If you didn't change the `docker-compose.yml` file, you will be able to contact the service using the address 
`POST http://127.0.0.1:3000/order/process`
The configuration can be edited in the `docker-compose.yml` file.

## Hubot install :

### Required Node.js et npm : 

    Sudo apt-get install nodejs
    Sudo apt-get install nodejs-legacy
    Sudo apr-get install npm

### Generator install:

    Sudo npm -g yo generator-hubot
    Npm install generator-angular
    Npm install generator-karma@>=0.9.0

### Persistence :

    Npm install hubot-redis-brain

### Creating bot folder :

    Cd Documents
    Mkdir jarvis
    Cd jarvis

### Creating bot : 

    Yo hubot

### Running :

    Bin/hubot
        
## Tests

    npm test
    
or

    mocha --recursive test