const s = (p) => {
    let video;
    let poseNet;
    let poses = [];
    let scaleRatioX, scaleRatioY;

    p.setup = () => {
        ml5.p5Utils.setP5Instance(p);
        // p.createCanvas(160, 120);
        p.createCanvas(window.innerWidth, window.innerHeight);
        video = p.createCapture(p.VIDEO);
        video.size(p.width, p.height);

        // Create a new poseNet method with a single detection
        poseNet = ml5.poseNet(video, modelReady);
        // This sets up an event that fills the global variable "poses"
        // with an array every time new poses are detected
        poseNet.on("pose", function (results) {
            poses = results;
        });
        // Hide the video element, and just show the canvas
        video.hide();
    };

    function modelReady() {
        console.log("Model Loaded");
        calcRatio();
    }

    function calcRatio() {
        let canvas1 = document.getElementsByClassName("p5Canvas")[0];
        let canvas2 = document.getElementById("webGL");

        scaleRatioX = canvas2.clientWidth / canvas1.clientWidth;
        scaleRatioY = canvas2.clientHeight / canvas1.clientHeight;

        console.log(scaleRatioX, scaleRatioY);
    }

    p.draw = function () {
        p.image(video, 0, 0, p.width, p.height);
        // We can call both functions to draw all keypoints and the skeletons
        drawKeypoints();
        drawSkeleton();
    };

    // A function to draw ellipses over the detected keypoints
    function drawKeypoints() {
        // Loop through all the poses detected
        for (let i = 0; i < poses.length; i++) {
            // For each pose detected, loop through all the keypoints
            let pose = poses[i].pose;
            for (let j = 0; j < pose.keypoints.length; j++) {
                // A keypoint is an object describing a body part (like rightArm or leftShoulder)
                let keypoint = pose.keypoints[j];
                // Only draw an ellipse is the pose probability is bigger than 0.2
                if (keypoint.score > 0.3) {
                    if (
                        keypoint.part == "rightWrist" ||
                        keypoint.part == "leftWrist"
                    ) {
                        p.fill(0, 255, 0);
                        let posX = keypoint.position.x * scaleRatioX;
                        let posY = keypoint.position.y * scaleRatioY;
                        // console.log(posX, posY);
                        let pointer = pointers.find((p) => p.id == -1);
                        if (pointer == null) pointer = new pointerPrototype();
                        // updatePointerDownData(pointer, -1, posX, posY);
                        updatePointerMoveData(pointer, posX, posY);
                    } else {
                        p.fill(255, 255, 255);
                    }
                    p.noStroke();
                    p.ellipse(keypoint.position.x, keypoint.position.y, 5, 5);
                }
            }
        }
    }

    // A function to draw the skeletons
    function drawSkeleton() {
        // Loop through all the skeletons detected
        for (let i = 0; i < poses.length; i++) {
            let skeleton = poses[i].skeleton;
            // For every skeleton, loop through all body connections
            for (let j = 0; j < skeleton.length; j++) {
                let partA = skeleton[j][0];
                let partB = skeleton[j][1];
                p.stroke(255, 0, 0);
                p.line(
                    partA.position.x,
                    partA.position.y,
                    partB.position.x,
                    partB.position.y
                );
            }
        }
    }
};

let myp5 = new p5(s, "ml5");
