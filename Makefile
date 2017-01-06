MOCHA:="./node_modules/.bin/mocha"

clean_test:
	rm -rf test/tmp
	rm -rf test/sites/smoke/node_modules
	rm -rf test/sites/smoke/tmp
	rm -rf test/sites/basic/node_modules
	rm -rf test/sites/basic/tmp
	rm -rf test/sites/dynamic/node_modules
	rm -rf test/sites/dynamic/tmp
	rm -rf test/sites/mounted/node_modules
	rm -rf test/sites/mounted/tmp

node_modules: package.json
	npm install

clean: clean_test
	rm -rf node_modules

test: node_modules
	npm link
	# basic 
	cd test/sites/basic/ && \
		npm link broccoli-taco && \
		npm install
	# dynamic 
	cd test/sites/dynamic/ && \
		npm link broccoli-taco && \
		npm install
	# mounted 
	cd test/sites/mounted/ && \
		npm link broccoli-taco && \
		npm install
	# run all the tests 
	npm test 

smoke_test: node_modules
	npm link
	cd test/sites/smoke/ && \
		npm link broccoli-taco && \
		npm install
	$(MOCHA) test/smoke.js

.PHONY: test smoke_test clean clean_test 
