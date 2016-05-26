**CRISP-8 is a CHIP-8 emulator for the browser written in TypeScript. It's in the early stages of development and is not usable yet.**

CHIP-8 is a virtual machine originally specified in 1978 by Joseph Weisbecker.

CHIP-8 information:

* [https://en.wikipedia.org/wiki/CHIP-8](https://en.wikipedia.org/wiki/CHIP-8)
* [http://www.chip8.com](http://www.chip8.com)

## Project Goals

My real goal is to write a BASIC interpreter, editor, and debugging environment to reverse engineer, understand, and preserve BASIC software written for home computers from the 70s and 80s. When I was a young I used to check out <cite>BASIC Computer Games</cite> (edited by David H. Ahl, 1973, 1978) from my local library even though I didn't have any way to run them. (I grew up with Macintosh computers in the house and didn't have the skills to translate Microsoft 8080 BASIC into something I could use on a 90s Mac.) I used to read the book and imagine how fun the games must be.

Today there are great projects like [PCBASIC] and [DOSBOX] and any number of emulators for every platform, including browsers, but these old programs still remain somewhat inaccessible. Even though we have the source code it can be unclear what is going on.

Take a look at some of these first few lines of <cite>Monster Combat</cite> by Lee J. Chapel, Microsoft version by Chris Vogeli:

    60 DIM E(10,10),B(10,10),M(11),M$(11),N(11),T$(11),P(11),G$(3)
    70 DIM C(15),D(15)

What do any of these arrays do? Who knows! We have to slowly pick apart the rest of the program to figure out what `N` is. What does this subroutine do? It changes a variable, but why? Why do these three places jump to it? And so on.

I want to build an environment that makes it easy to inspect a BASIC program as it runs. As it becomes clear what each variable does, the editor will allow you to add labels and annotations, or even restructure code to avoid the GOTO spaghetti. I hope to build a tool that lets us do more than just run these old programs: I hope we'll be able to understand them too.

This is a big project. Compared to BASIC, CHIP-8 is a trivial platform to interpret and emulate. CRISP-8 will let me experiment with some of these ideas without having to worry about BASIC as well.

### On Language, Libraries, and Tooling

Most projects seem concerend with existing five or ten years from now. If the goal of this project is to preserve softare, I want this system to be usable forty years from now in the way that BASIC programs aren't. There aren't many languages that I think will survive in a generally usable way for that long, but C/C++ and JavaScript come to mind. (Other languages such as Java will still be around, but I wonder if it will be more like COBOL as a specialized legacy language to support old codebases or if it will still be a general purpose language.)

It's incredibly hard to write correct code in C, and C++ is such a tangle of semantics that I don't feel capable of writing good code in it. JavaScript in the browser is a very compelling answer. Websites written nearly twenty years ago still work remarkably well (at least where they avoid browser-specific langauge extentions that didn't even work outside of a specific configuration in the 90s). As much as we think about apps these days I don't see the browser or the web disappearing anytime soon.

I find JavaScript very challening to write, mostly because its dynamic nature and lack of a compiler pass mean I spend a lot of time fixing very basic errors such as misspelled names. But TypeScript fixes a lot of the basic issues with JavaScript.

It seems like I'm contradicting myself: There's little guarantee TypeScript will be generally avaiable forty years from now, especailly as future JavaScript standards address many of the same pain points that TypeScript solves.

But I find the output of TypeScript to be nearly as good as the JavaScript I would hand write. I think the "compiled" output of TypeScript stands fine on its own, and so if this project is only usable in its built JavaScript form I think that might be okay.

CRISP-8 avoids third party libraries and other tools for similar reasons of long-term survival.

I'm using node.js because it's the most convenient way to run JavaScript from a command line, but I don't expect it to be readily available in forty years. I'm going to use it only as a front end to help day-to-day development, and if it stops working the core project will still function fine.

I prefer reimplementing instead of bringing in third party libraries for small pieces of functionality. I'd rather write my own leftPad than add a dependency.

Maybe I'm wrong about all of this. That's part of why CRISP-8 exists: it gives me a chance to test some of these ideas.

[PCBASIC]: http://www.pc-basic.org
[DOSBOX]: http://www.dosbox.com
