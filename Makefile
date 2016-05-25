all: node

node: crisp8node

crisp8node:
	tsc --out build/crisp8 src/node/crisp8node.ts

clean:
	rm -rf build