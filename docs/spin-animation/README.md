## Spin Animation

Live demo at: [apps.amandaghassaei.com/botanigram/docs/spin-animation/](https://apps.amandaghassaei.com/botanigram/docs/spin-animation/)

[P5.js](https://p5js.org/) code can be found at: [github.com/amandaghassaei/botanigram/blob/main/docs/spin-animation/index.js](https://github.com/amandaghassaei/botanigram/blob/main/docs/spin-animation/index.js)


## To Edit

Download the repository from [Github](https://github.com/amandaghassaei/botanigram).

Create an image with a square crop so that the center point of the image is the center of rotation.  You can do this in [the app](https://apps.amandaghassaei.com/botanigram/) by uploading your image, selecting the center, then hitting the `p` key.  (Note: this will save a high resolution square image, which may run slowly and produce a massive video file, resize the image as needed).

Copy the image to the `docs/spin-animation` folder in the repo and edit the line in `index.js` to point to your file:

```js
const filename = "Square_Crop.jpg";
```

Other parameters to edit:

```js
const reverseSpin = true; // False is CCW, true is CW.
const recordVideo = true;
const rotationAngle = 2.4; // In radians (golden angle is 2.4 rad).
```

## To Run

Run a local server from the repo root:

```sh
python -m SimpleHTTPServer
```

In Chrome, navigate to the url `http://localhost:8000/docs/spin-animation/`

If you are recording a video, you can open the console to see the progress of the MP4 export.  The export process takes a few minutes.