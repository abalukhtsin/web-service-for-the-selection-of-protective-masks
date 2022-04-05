    function drawLine( ctx, x1, y1, x2, y2 ) {
        ctx.beginPath();
        ctx.moveTo( x1, y1 );
        ctx.lineTo( x2, y2 );
        ctx.stroke();
    }

    async function setupWebcam() {
        return new Promise( ( resolve, reject ) => {
            const webcamElement = document.getElementById( "webcam" );
            const navigatorAny = navigator;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
                navigatorAny.msGetUserMedia;
            if( navigator.getUserMedia ) {
                navigator.getUserMedia( { video: true },
                    stream => {
                        webcamElement.srcObject = stream;
                        webcamElement.addEventListener( "loadeddata", resolve, false );
                    },
                    error => reject());
            }
            else {
                reject();
            }
        });
    }

    let output = null;
    let model = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    let mask = null;

    function loadModel( file ) {
        return new Promise( ( res, rej ) => {
            const loader = new THREE.GLTFLoader();
            loader.load( file, function ( gltf ) {
                res( gltf.scene );
            }, undefined, function ( error ) {
                rej( error );
            } );
        });
    }

    async function trackFace() {
        const video = document.querySelector( "video" );
        output.drawImage(
            video,
            0, 0, video.width, video.height,
            0, 0, video.width, video.height
        );
        renderer.render( scene, camera );

        const faces = await model.estimateFaces( {
            input: video,
            returnTensors: false,
            flipHorizontal: false,
        });

        faces.forEach( face => {
            // Draw the bounding box
            const x1 = face.boundingBox.topLeft[ 0 ];
            const y1 = face.boundingBox.topLeft[ 1 ];
            const x2 = face.boundingBox.bottomRight[ 0 ];
            const y2 = face.boundingBox.bottomRight[ 1 ];
            const bWidth = x2 - x1;
            const bHeight = y2 - y1;
            drawLine( output, x1, y1, x2, y1 );
            drawLine( output, x2, y1, x2, y2 );
            drawLine( output, x1, y2, x2, y2 );
            drawLine( output, x1, y1, x1, y2 );

            mask.position.x = face.annotations.noseTip[ 0 ][ 0 ];
            mask.position.y = -face.annotations.noseTip[ 0 ][ 1 ]+face.annotations.noseTip[ 0 ][ 1 ]*0.02;
            mask.position.z = -camera.position.z + 2*face.annotations.noseTip[0][2];

            // Calculate an Up-Vector using the eyes position and the bottom of the nose
            mask.up.x = face.annotations.midwayBetweenEyes[ 0 ][ 0 ] - face.annotations.noseBottom[ 0 ][ 0 ];
            mask.up.y = -( face.annotations.midwayBetweenEyes[ 0 ][ 1 ] - face.annotations.noseBottom[ 0 ][ 1 ] );
            mask.up.z = face.annotations.midwayBetweenEyes[ 0 ][ 2 ] - face.annotations.noseBottom[ 0 ][ 2 ];
            const length = Math.sqrt( mask.up.x ** 2 + mask.up.y ** 2 + mask.up.z ** 2 );
            mask.up.x /= length;
            mask.up.y /= length;
            mask.up.z /= length;

            // Scale to the size of the head
            const eyeDist = Math.sqrt(
                ( face.annotations.leftEyeUpper1[ 3 ][ 0 ] - face.annotations.rightEyeUpper1[ 3 ][ 0 ] ) ** 2 +
                ( face.annotations.leftEyeUpper1[ 3 ][ 1 ] - face.annotations.rightEyeUpper1[ 3 ][ 1 ] ) ** 2 +
                ( face.annotations.leftEyeUpper1[ 3 ][ 2 ] - face.annotations.rightEyeUpper1[ 3 ][ 2 ] ) ** 2
            );
            mask.scale.x = eyeDist / 6;
            mask.scale.y = eyeDist / 6;
            mask.scale.z = eyeDist / 6;

            mask.rotation.y = Math.PI;
            mask.rotation.z = Math.PI / 2 - Math.acos( mask.up.x );
        });

        requestAnimationFrame( trackFace );
    }

    (async () => {
        await setupWebcam();
        const video = document.getElementById( "webcam" );
        video.play();
        let videoWidth = video.videoWidth;
        let videoHeight = video.videoHeight;
        video.width = videoWidth;
        video.height = videoHeight;

        let canvas = document.getElementById( "output" );
        canvas.width = video.width;
        canvas.height = video.height;

        let overlay = document.getElementById( "overlay" );
        overlay.width = video.width;
        overlay.height = video.height;

        output = canvas.getContext( "2d" );
        output.translate( canvas.width, 0 );
        output.scale( -1, 1 ); // Mirror cam
        output.fillStyle = "#fdffb6";
        output.strokeStyle = "#fdffb6";
        output.lineWidth = 2;

        // Load Face Landmarks Detection
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );

        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById( "overlay" ),
            alpha: true
        });

        camera = new THREE.PerspectiveCamera( 45, 1, 0.1, 2000 );
        camera.position.x = videoWidth / 2;
        camera.position.y = -videoHeight / 2;
        camera.position.z = -( videoHeight / 2 ) / Math.tan( 45 / 2 ); // distance to z should be tan( fov / 2 )

        scene = new THREE.Scene();
        scene.add( new THREE.AmbientLight( 0xcccccc, 0.4 ) );
        camera.add( new THREE.PointLight( 0xffffff, 0.8 ) );
        scene.add( camera );

        camera.lookAt( { x: videoWidth / 2, y: -videoHeight / 2, z: 0, isVector3: true } );

        // Glasses from https://sketchfab.com/3d-models/heart-glasses-ef812c7e7dc14f6b8783ccb516b3495c
        //mask = await loadModel( "3d-model/mask-black.gltf" );
        mask = await loadModel( "3d-model/mask-black.gltf" );
        scene.add( mask );

        trackFace();
    })();
