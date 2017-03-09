#!/usr/bin/env bash

# DOCKER

# Install dependencies
apt-get update
apt-get install -y \
    linux-image-extra-$(uname -r) \
    linux-image-extra-virtual \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    python-software-properties

# Add Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Set up the stable repository
add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

# Install Docker
apt-get update
apt-get install -y docker-ce

# Start on boot
service docker start

docker run -d -p 5000:5000 --restart=always --name registry registry:2

# JENKINS

# Install dependencies
apt-get update
apt-get upgrade -y
apt-get install -y \
    nano \
    git \
    openjdk-8-jdk \
    openjdk-8-jdk-headless \
    maven \
    ruby \
    python \
    python-pip \
    python3 \
    python3-pip \

if [ ! -f /usr/bin/nodejs ]; then
   curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
   apt-get install -y nodejs
   apt-get install -y build-essential
   npm install -g grunt-cli gulp-cli bower
fi

if [ ! -d /var/lib/jenkins ]; then
   wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
   if [ ! -f /etc/apt/sources.list.d/jenkins.list ]; then
       echo "deb https://pkg.jenkins.io/debian-stable binary/" >> /etc/apt/sources.list.d/jenkins.list
   fi
   apt-get update
   apt-get install jenkins -y
   if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
     cat /var/lib/jenkins/secrets/initialAdminPassword
   fi
fi

# Install Jenkins' Docker plugin
curl http://updates.jenkins-ci.org/latest/docker-build-step.hpi -O
mv docker-build-step.hpi /var/lib/jenkins/plugins/docker-build-step.hpi
service jenkins restart