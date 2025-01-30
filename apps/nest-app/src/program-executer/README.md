Run docker without sudo

https://docs.docker.com/engine/install/linux-postinstall/

- Add your user to the docker group. `sudo usermod -aG docker $USER`

- Log out and log back in so that your group membership is re-evaluated.

- If you're running Linux in a virtual machine, it may be necessary to restart the virtual machine for changes to take effect.

- You can also run the following command to activate the changes to groups: `newgrp docker`

- Verify that you can run docker commands without sudo. `docker run hello-world`
