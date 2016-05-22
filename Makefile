HOMEDIR = $(shell pwd)
SMUSER = noderunner
SERVER = sprigot-droplet
SSHCMD = ssh $(SMUSER)@$(SERVER)
PROJECTNAME = circlejams
APPDIR = /var/www/$(PROJECTNAME)

# Many of these targets need the SMUSER environment to be defined, which should be the
# username of the user on SERVER that has the permissions to execute these operations.

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@$(SERVER):/var/www/ --exclude node_modules/ --exclude data/
	ssh $(SMUSER)@$(SERVER) "cd $(APPDIR) && npm install"

set-permissions:
	$(SSHCMD) "chmod 777 -R $(APPDIR)/data"

update-remote: sync set-permissions
