This app creates stop-motion animations of plants by rotating a single image to create a "growing" illusion.  It's based on a natural phenomenon called the [golden angle](https://en.wikipedia.org/wiki/Golden_angle#Golden_angle_in_nature), which governs the spacing of leaves, petals, and branches on many growing plants.  The golden angle (137.5&deg;) is responsible for the spiral patterns on pinecones, sunflowers, and succulents, and is related to the Fibonacci series and the golden ratio.

A great explanation of the golden angle and how it relates to plant growth can be found in the video ["Doodling in Math: Spirals, Fibonacci, and Being a Plant"](https://www.youtube.com/watch?v=ahXIMUkSXX0).


###  What Types of Plants Will Work?

Experiment with what you can find around you!  Pinecones, cacti, and succulents usually work well, but even common plants like weeds growing in the cracks of the sidewalk or vegetables from the grocery store can produce stunning animations.  Ideal subjects are symmetric with many stages of development visible in a single image.  Look for plants exhibiting [Fibonacci spirals](https://en.wikipedia.org/wiki/Golden_ratio#Nature).

As you start exploring, you'll notice that some plants grow with pairs of leaves opposite (180&deg;) from each other – like basil and mint.  These are worth a try, but in general they won't create as strong of a growing illusion.


### Photography Tips

No special photography equipment required!  Center the camera over your subject and take a single overhead shot.  The best photographs are evenly lit, ideally with diffuse, indirect lighting.  If you are photographing in direct sunlight, try to cast a shadow over your subject to improve the quality of your animations.


### Import Your Photo

<img class="lazy uk-box-shadow-large" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/import_photo.gif" alt="screen recording shows how to import photo into app" style="max-width: 600px;"/>

Import your photo by dragging it directly into the app or copying and pasting it into the app.  You can also select a file from your device using the "select file" link under the control panel.  While using this app, your photos never leave your computer (they are not uploaded to a server).

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/upload_photo.jpg" alt="image upload UI" style="max-width: 400px;"/>


### Select Center of Rotation

<img class="lazy uk-box-shadow-large" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/select_center.gif" alt="screen recording shows how to select center of rotation of image" style="max-width: 600px;"/>

While the animation is paused, select the center of rotation by clicking directly on the image viewer.  Pinch/scroll to enlarge the image.  Drag the image slowly or use the left/right and up/down arrows on your keyboard to make fine adjustments to the center of rotation.


### What Rotation Angle Should I Use?

Short answer: Use the golden angle (137.5&deg;), this will work in the majority of cases.

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/golden.jpg" alt="plant leaves with golden angle highlighted" style="max-width: 500px;"/>

Long answer: The rotation angle required to create a great animation depends on your image and the growth dynamics of your subject.  Many plants grow with golden angle spacing between sequential leaves, so try 137.5&deg; first.  The image above shows leaf order labeled and the golden angle indicated between leaves 4/5, 5/6, and 6/7.

Leaf spacing can vary from species to species or arise from unique environmental factors during a plant's development – occasionally, two plants of the same species may even display different leaf spacings.  If the golden angle doesn't work, you might also try the Lucas angle (99.5&deg;).  Lucas angle plants are relatively uncommon, but if you photograph enough plants you will see one eventually:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/lucas.jpg" alt="plant leaves with lucas angle highlighted" style="max-width: 500px;"/>

TIP: If you can count the spirals on your plant (or, for some cacti, the number of lobes/arms), that can help determine the angle to use.  If the number is part of the Fibonacci series (1, 2, 3, 5, 8, 13, 21, 34), that's a good indication that you should use the golden angle.  If the number is part of the Lucas series (1, 3, 4, 7, 11, 18, 29), try the Lucas angle.

You can also experiment with different angles see how it affects the animation; there may be more than one "right" answer.  This succulent has 137.5&deg; leaf spacing, but the animation progresses very slowly using the golden angle:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/137.5_deg_slow.gif" alt="137.5 degree animation of succulent is too slow" style="max-width: 300px;"/>

If you can identify distinct spirals on your plant, you might try dividing 360 by the number of spiral arms, or use some integer multiple of this angle.  I counted 13 spirals arms, so I used 360&deg; / 13 = 27.6&deg; as a starting point:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/spirals.jpg" alt="13 spiral arms in pattern of leaves on succulent" style="max-width: 400px;"/>

From there, I found that if I multiplied 27.6 by 2 (55.3&deg;) and adjusted the angle slightly to 52.9&deg;, the animation stabilized to something that evolves more quickly:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/52.9_deg.gif" alt="52.9 degree animation of succulent" style="max-width: 300px;"/>

Other multiples of 27.6&deg; might be worth looking at as well.  In fact, the golden angle of 137.5&deg; is approximately 27.6&deg; * 5 = 138&deg; (this is not a coincidence, it comes straight from the Fibonacci series).  If you select the "Rotation Angle" control, you can press the up and down arrow keys to quickly scan through angles and experiment:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/rotation_angle.jpg" alt="rotation angle UI" style="max-width: 350px;"/>

Another example is this star-shaped cactus with five lobes (a Fibonacci number), which more-or-less "works" at 137.5&deg;:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/137.5_deg.gif" alt="137.5 degree animation of cactus" style="max-width: 300px;"/>

Since this cactus has five arms coming out of it, the angle between adjacent arms is 360&deg; / 5 = 72&deg;.  I noticed that sequential spots on the cactus are spaced 2 arms apart, so I adjusted the angle slightly to 72&deg; * 2 = 144&deg; to fix the orientation of the plant in the animation:

<img class="lazy" data-src="https://raw.githubusercontent.com/amandaghassaei/botanigram/main/docs/144_deg.gif" alt="144 degree animation of cactus" style="max-width: 300px;"/>


### I Made Something, Now What?

You can export your animation as a GIF, MP4 video, or still PNG frames.  Once you get the hang of it, feel free to [submit your animations](#modal-gallery) to be featured in app!


### More Ideas

Some easier examples that I'm hoping to feature more of, please [submit images](#modal-gallery) if you have them:

- Cabbage slices: sliced cabbage (especially red cabbage) works great in the app.  Some (unsliced) ornamental cabbages also produce great results.
- Astrophytum asterias (e.g. sea urchin cactus, sand dollar cactus): the little tufts and patterns on these cacti [make great animations](https://twitter.com/amandaghassaei/status/1494313936988082179)!
- Succulents: many shapes and sizes of succulents work great, bonus points if you can provide the species name when you submit.
- Cacti: if the cactus has lobes/arms, count those first to see if you're dealing with a 3, 5, 8, or 13-lobed Fibonacci cactus, those should work most of the time.
- Pinecones: again count up the spirals to determine if it's following Fibonacci rules (Fibonacci pinecones have 5, 8, 13, or 21 spirals) or Lucas rules (Lucas pinecones have 7, 11, or 18, spirals).

Here are ideas for challenging examples I'm hoping to include in this app:

- Strawberry: the patterns of seeds form Fibonacci spirals, but you likely need a very symmetric strawberry for it to work.
- Romanesco broccoli (fractal broccoli): again, needs to be very symmetric – I've noticed most of these tend to have a slight curve, maybe a single floret would work better?
- Celery rosette: if you cut a very large head of celery at the base, the cross section of the stalks should create a nice effect.
- Dahlia/sunflower/daisy: must be very symmetric to work.
- Fennel flowers (or some other branched flower like Queen Anne's lace).

Other types of objects that exhibit spirals or Fibonacci patterns might be interesting to try (e.g. shells, peacock tail "eyes") – experiment with using different rotation angles as the golden angle may not apply.


### Feedback

Send feedback/bugs to [botanigram@gmail.com](mailto:botanigram@gmail.com?subject=Feedback) or leave a [discussion](https://github.com/amandaghassaei/botanigram/discussions) or [issue](https://github.com/amandaghassaei/botanigram/issues) on Github.