create-docker-machine:
	docker-machine create --driver virtualbox dev

stop-docker-machine:
	docker-machine stop dev

start-docker-machine:
	docker-machine start dev

# connect-to-docker-machine:
	# eval "$(docker-machine env dev)"

build-docker-image:
	docker build -t jkang/circlejams .

push-docker-image: build-docker-image
	docker push jkang/circlejams

run-docker-image:
	docker run -v $(HOMEDIR)/config:/usr/src/app/config \
		jkang/circlejams node post-verse.js

pushall: push-docker-image
	git push origin master

followback:
	node followback.js
