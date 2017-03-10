#!/usr/bin/python

import ansible.runner

if __name__ == "__main__":
    runner = ansible.runner.Runner(
         module_name='jenkins_plugins.yml',
         module_args="host=127.0.0.1 "\
                     "username = admin "\
                     "password=admin "\
                     "facts=interface_detail",
         pattern="jenkins",
         transport="local",
         forks=1
    )
    runner.run()