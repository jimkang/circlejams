HOMEDIR = $(shell pwd)
SERVER = smidgeo-headporters
SSHCMD = ssh $(SMUSER)@$:(SERVER)
PROJECTNAME = circlejams
APPDIR = /var/apps/$(PROJECTNAME)

# Many of these targets need the SMUSER environment to be defined, which should be the
# username of the user on SERVER that has the permissions to execute these operations.

pushall: sync
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(SMUSER)@smidgeo-headporters:/var/apps/ --exclude node_modules/ --exclude data/
	ssh $(SMUSER)@smidgeo-headporters "cd /var/apps/$(PROJECTNAME) && npm install"

set-permissions:
	$(SSHCMD) "chmod 777 -R $(APPDIR)/data"

update-remote: sync set-permissions
