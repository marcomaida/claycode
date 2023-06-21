default: macos

macos:
	(sleep 1 && open http://localhost:731/index.html) & (cd claycode && python3 -m http.server 731)

linux:
	cd claycode && sudo python -m SimpleHTTPServer 731 &
	sleep 1
	xdg-open http://localhost:731/index.html

find_server:
	ps -fA | grep SimpleHTTPServer

requirements:
	python3 -m pip install simple-http-server
