REPORTER = spec

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--growl

test-debug:
	@./node_modules/.bin/mocha debug \
		--require should \
		--reporter $(REPORTER) \
		--growl

.PHONY: test test-debug
