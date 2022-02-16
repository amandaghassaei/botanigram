Created by [Amanda Ghassaei](https://amandaghassaei.com/).

This project was inspired by the ["Blooms" series of work by John Edmark](http://www.johnedmark.com/phifib/2016/4/28/blooms-strobe-animated-phi-based-sculptures).  I came across an interview where Edmark describes how you can [spin real plants to produce similar animated effects](http://www.johnedmark.com/natural-blooms-1/2016/4/29/strobe-animated-artichoke-an-example-of-a-naturally-occurring-bloom) and found myself wishing I could test it out on every plant I saw around me.


### How Does This Work?

A single image of a plant contains information about the past and the future of the organism.  You can look at a single branch of flowers and see every stage of the development process: from tiny buds to fully opened blooms:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/orchid_branch.jpg" alt="orchid branch showing flowers in many stages of development" style="max-width: 600px;"/>

Similarly, an image of a succulent shows many stages of leaf development.  The large leaves around the outside of the plant were formed first and the smallest leaves in the center formed most recently:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/golden.jpg" alt="succulent with leaf growing order and the golden angle indicated" style="max-width: 500px;"/>

Sequential leaves are spaced by the golden angle (137.5 degrees); by rotating the image by this angle, we can see the leaves from smallest to largest - giving the illusion that the leaf is slowly morphing from a small leaf bud into a fully mature leaf.  This works similarly to a [zoetrope](https://en.wikipedia.org/wiki/Zoetrope), an early animation device that pre-dates film.  Zoetropes work by displaying a sequence of gradually changing images, giving the illusion of motion (or, in this case, growing).

If you're interested in learning more about the relationship between the Fibonacci series and the spiral growth patterns on plants, I recommend checking out the three part YouTube series: ["Doodling in Math: Spirals, Fibonacci, and Being a Plant"](https://www.youtube.com/watch?v=ahXIMUkSXX0) by Vi Hart.


### Source Code

All source code for this project is available on [Github](https://github.com/amandaghassaei/botanigram).