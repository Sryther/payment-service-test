#!/usr/bin/env bash

# ==================================
# DOCKER
# ==================================

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

apt-get update
apt-get install -y docker-ce

# Open TCP
mv /etc/init/docker.conf /etc/init/docker.conf.old
sed "0,/DOCKER_OPTS=/{s+DOCKER_OPTS=+DOCKER_OPTS='-H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock'+}" /etc/init/docker.conf.old > /etc/init/docker.conf

# Start the private registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# ==================================
# JENKINS
# ==================================

# Install dependencies
add-apt-repository ppa:openjdk-r/ppa

wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
if [ ! -f /etc/apt/sources.list.d/jenkins.list ]; then
   echo "deb https://pkg.jenkins.io/debian-stable binary/" >> /etc/apt/sources.list.d/jenkins.list
fi

apt-get update
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
    jenkins \

# ==================================
# ANSIBLE
# ==================================

apt-add-repository ppa:ansible/ansible-1.9
apt-get update
apt-get install -y \
    python-jenkins \
    libxml2-dev \
    libxslt1-dev \
    python-dev \
    ansible

# ==================================
# CONFIGURE JENKINS
# ==================================

python /vagrant/ansible/ansible-script.py

# Create missing directories
mkdir -p /var/lib/jenkins/init.groovy.d

# Enable user admin/admin
cp /vagrant/jenkins/basic-security.groovy /var/lib/jenkins/init.groovy.d/basic-security.groovy

# Add the configurations
cp /vagrant/jenkins/configuration/*.xml /var/lib/jenkins/

# Add the pre-configured job
mkdir -p /var/lib/jenkins/jobs/payment-service
cp /vagrant/jenkins/jobs/payment-service-jenkins-job.xml /var/lib/jenkins/jobs/payment-service/config.xml

# Set the owner to jenkins
chown -R jenkins:jenkins /var/lib/jenkins

# Restart the service
service jenkins restart
