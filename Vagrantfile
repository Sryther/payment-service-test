# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network :forwarded_port, guest: 5000, host: 5000
  config.vm.network "forwarded_port", guest: 8080, host: 8090
  # config.vm.network "forwarded_port", guest: 22, host: 22

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.provision :shell, :path => "provision.sh"
end
