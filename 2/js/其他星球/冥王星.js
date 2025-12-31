

// 渲染器
let renderer = null;
// 渲染场景
let scene = null;
// 相机
let camera = null
// 控制器
var orbitcontrols = null
// 太阳
var sun = null;
// 所有星球
var planets = []

var active = true;
// 创建渲染器
function initRender() {
    // 获取渲染的元素
    let canvas = document.getElementById("main")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 3D场景与浏览器的画布渲染器
    let renderer = new THREE.WebGLRenderer({
        canvas, // 找到画布
        alpha: true, // 启用画布透明背景
        antilias: true //  启用抗锯齿，让 3D 边缘更平滑
    })

    //适配设备像素比（解决画布模糊，核心正确）
    renderer.setPixelRatio(window.devicePixelRatio);
    // 启用阴影映射
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true; //柔和阴影
    renderer.setClearColor(0xffffff, 0);

    return renderer
}

// 创建场景
function initScene() {
    // 创建空场景（所有 3D 物体/光源/相机最终都需挂载到场景中才能渲染）
    const scene = new THREE.Scene();
    return scene
}

// 创建相机
function initCamera() {
    // 创建透视相机（模拟人眼透视效果，适合太阳系这类 3D 大场景）
    let camera = new THREE.PerspectiveCamera(
        35, // 角度
        window.innerWidth / window.innerHeight,  ///宽高比：适配窗口尺寸，避免画面拉伸
        1, //近裁剪面
        3000 //远裁剪面
    )
    camera.position.set(-200, 50, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // 相机看向原点 (0,0,0)（太阳系中心，比如太阳的位置）
    return camera
}
// 创建太阳
function initSun() {
    // // 创建纹理加载器（用于加载行星/太阳的纹理贴图）
    let loader = new THREE.TextureLoader();
    // 太阳  球体几何体（半径14，横向分段30，纵向分段30）
    const sunGeo = new THREE.SphereGeometry(30, 30, 30);
    // 贴纸
    const sunMat = new THREE.MeshBasicMaterial({
        map: loader.load("./img/pluto_bg.jpg"),
    });

    const sun = new THREE.Mesh(sunGeo, sunMat);
    return sun
}

// 场景控制器
function initOrbitcontrols() {
    return new THREE.OrbitControls(camera, renderer.domElement);
}

/**
 *
 * 加载行星（带轨道、标签、公转容器、土星环）
 * @param {string} name - 行星英文名称（mercury/saturn等）
 * @param {number} radius - 行星半径
 * @param {number} position - 公转轨道半径
 * @param {number} speed - 公转速度（值越小越慢）
 * @param {number} rotationSpeed - 自转速度（值越小越慢）
 * @returns {THREE.Object3D} 行星公转容器 * 加载行星（带轨道、标签、公转容器、土星环）
 */
function loadPlanet(name, radius, position, speed, rotationSpeed) {
    // // 创建纹理加载器（用于加载行星/太阳的纹理贴图）
    let loader = new THREE.TextureLoader();
    const planetGeo = new THREE.SphereGeometry(radius, 30, 30);
    const planetMat = new THREE.MeshBasicMaterial({
        map: loader.load("./img/" + name + "_bg.jpg"),
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    const planetSystem = new THREE.Object3D();

    // 向后偏移
    planet.position.z -= position
    planetSystem.add(planet)
    // 公转速度
    planetSystem.speed = speed
    // 自转速度
    planetSystem.rotationSpeed = rotationSpeed

    if (name == "saturn") {
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: loader.load(`./img/${name}_ring.jpg`),
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(radius * 1.2, radius * 1.5, 64, 1),
            ringMaterial
        );
        ring.rotation.x = -Math.PI / 2;
        planet.add(ring);
    }

    //   行星轨迹
    const trackGeometry = new THREE.RingGeometry(
        position,
        position + 0.05, // 轨道宽度从0.05→0.2，更明显
        128, // 分段数128，轨道更平滑
        1 // 分段数
    );
    //
    const trackMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // 轨道颜色（白色）
        side: THREE.DoubleSide,
        transparent: true, // 透明
        opacity: 0.3, // 透明度（不遮挡行星）
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);
    // 行星加入太阳
    sun.add(planetSystem);
    return planetSystem
}


// 背景星星
function initParticle() {
    /*背景星星*/
    const particles = 20000; //星星数量
    /*buffer做星星*/
    let bufferGeometry = new THREE.BufferGeometry();

    let positions = new Float32Array(particles * 3);
    let colors = new Float32Array(particles * 3);

    let color = new THREE.Color();

    const gap = 900; // 定义星星的最近出现位置

    for (let i = 0; i < positions.length; i += 3) {
        // positions

        /*-2gap < x < 2gap */
        let x = Math.random() * gap * 2 * (Math.random() < 0.5 ? -1 : 1);
        let y = Math.random() * gap * 2 * (Math.random() < 0.5 ? -1 : 1);
        let z = Math.random() * gap * 2 * (Math.random() < 0.5 ? -1 : 1);

        /*找出x,y,z中绝对值最大的一个数*/
        let biggest =
            Math.abs(x) > Math.abs(y)
                ? Math.abs(x) > Math.abs(z)
                    ? "x"
                    : "z"
                : Math.abs(y) > Math.abs(z)
                    ? "y"
                    : "z";

        let pos = { x, y, z };

        /*如果最大值比n要小（因为要在一个距离之外才出现星星）则赋值为n（-n）*/
        if (Math.abs(pos[biggest]) < gap)
            pos[biggest] = pos[biggest] < 0 ? -gap : gap;

        x = pos["x"];
        y = pos["y"];
        z = pos["z"];

        positions[i] = x;
        positions[i + 1] = y;
        positions[i + 2] = z;

        // colors

        /*70%星星有颜色*/
        let hasColor = Math.random() > 0.3;
        let vx, vy, vz;

        if (hasColor) {
            vx = (Math.random() + 1) / 2;
            vy = (Math.random() + 1) / 2;
            vz = (Math.random() + 1) / 2;
        } else {
            vx = 1;
            vy = 1;
            vz = 1;
        }

        color.setRGB(vx, vy, vz);

        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }

    bufferGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    bufferGeometry.computeBoundingSphere();

    /*星星的material*/
    let material = new THREE.PointsMaterial({
        size: 6,
        vertexColors: THREE.VertexColors,
    });
    const particleSystem = new THREE.Points(bufferGeometry, material);

    return particleSystem;
}


// 运行（循环）
function render() {
    // 太阳自转
    sun.rotateY(0.004)
    // 其他星球自转
    for (var i = 0; i < planets.length; i++) {
        // 公转
        planets[i].rotateY(planets[i].speed);
        // 自转
        planets[i].children[0].rotateY(planets[i].rotationSpeed);
    }
    orbitcontrols.update();
    renderer.render(scene, camera);
    if (active == true) {
        requestAnimationFrame(render)
    }
}

// 渲染器
renderer = initRender()
// 渲染场景
scene = initScene()
// 相机
camera = initCamera()
// 星星背景
var particleSystem = initParticle();

// 控制器
var orbitcontrols = initOrbitcontrols()
orbitcontrols.update();

orbitcontrols.update();
// 生成太阳
sun = initSun()
// 将太阳加入场景
scene.add(camera)
scene.add(sun)

scene.add(particleSystem);
// 其他星球
// //添加水星
// const Mercury = loadPlanet("mercury", 2, 20, 0.02, 0.002);
// planets.push(Mercury);
// //添加金星
// const Venus = loadPlanet("venus", 4, 30, 0.012, 0.002);
// planets.push(Venus);
// //添加地球
// const Earth = loadPlanet("earth", 5, 40, 0.01, 0.002);
// planets.push(Earth);
// //添加火星
// const Mars = loadPlanet("mars", 4, 50, 0.008, 0.002);
// planets.push(Mars);
// //添加木星
// const Jupiter = loadPlanet("jupiter", 9, 70, 0.006, 0.002);
// planets.push(Jupiter);
// //添加土星
// const Saturn = loadPlanet("saturn", 7, 100, 0.005, 0.01);
// planets.push(Saturn);
// //添加天王星
// const Uranus = loadPlanet("uranus", 4, 120, 0.003, 0.002);
// planets.push(Uranus);
// //添加海王星
// const Neptune = loadPlanet("neptune", 3, 150, 0.002, 0.008);
// planets.push(Neptune);
// //添加冥王星
// const Pluto = loadPlanet("pluto", 4, 160, 0.0016, 0.012);
// planets.push(Pluto);


// 运行
requestAnimationFrame(render)

