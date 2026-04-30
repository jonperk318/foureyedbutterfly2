default: restart

env:
	export NODE_OPTIONS="--max-old-space-size=4096"

build:
	pnpm build

restart:
	service nginx reload --watch

start:
	service nginx start --watch
	
stop:
	service nginx stop

i:
	pnpm i

install:
	make i

renew:
	sudo certbot renew --nginx
