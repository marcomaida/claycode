default: macos

macos:
	(sleep 1 && open http://localhost:731/index.html) & (python3 -m http.server 731)

linux:
	sudo python3 -m http.server 731 &
	sleep 1
	xdg-open http://localhost:731/index.html

find_server:
	ps -fA | grep http.server

requirements:
	python3 -m pip install simple-http-server
