all: node

node: crisp8node crisp8testnode

crisp8node:
	tsc --out build/crisp8.js --sourceMap src/node/crisp8node.ts

crisp8testnode:
	tsc --out build/crisp8test.js --sourceMap src/node/crisp8testnode.ts

test: crisp8testnode
	node build/crisp8test.js tests/crisp8

clean:
	rm -rf build
