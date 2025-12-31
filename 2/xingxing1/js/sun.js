//  初始化
const canvas = document.getElementById("main");
/*画布大小*/
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// 抽象 3D 场景与浏览器画布的核心渲染器
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true, // 启用画布透明背景
    antialias: true, //  启用抗锯齿，让 3D 边缘更平滑
});
//适配设备像素比（解决画布模糊，核心正确）
renderer.setPixelRatio(window.devicePixelRatio);
// 启用阴影映射
renderer.shadowMap.enabled = true;
// renderer.shadowMapSoft = true; //柔和阴影
renderer.setClearColor(0xffffff, 0);

// 创建空场景（所有 3D 物体/光源/相机最终都需挂载到场景中才能渲染）
const scene = new THREE.Scene();

// 创建透视相机（模拟人眼透视效果，适合太阳系这类 3D 大场景）
const camera = new THREE.PerspectiveCamera(
    35, //视野角（FOV）：垂直方向视野范围 45°，值越小视角越窄（长焦），越大越宽（广角）
    window.innerWidth / window.innerHeight, //宽高比：适配窗口尺寸，避免画面拉伸
    1, //近裁剪面：距离相机 <1 的物体不会渲染（太阳系近物体如行星需避免裁掉）
    3000 //远裁剪面：距离相机 >3000 的物体不会渲染（太阳系远行星/彗星需覆盖）
);
camera.position.set(-200, 50, 0); //设置相机位置：三维坐标 (-200, 50, 0)（在 X 轴左侧、Y 轴上方、Z 轴原点）
camera.lookAt(new THREE.Vector3(0, 0, 0)); // 相机看向原点 (0,0,0)（太阳系中心，比如太阳的位置）
scene.add(camera);

var orbitcontrols = new THREE.OrbitControls(camera, renderer.domElement);
orbitcontrols.update();

// // 创建纹理加载器（用于加载行星/太阳的纹理贴图）
const loader = new THREE.TextureLoader();

// 太阳
const sunGeo = new THREE.SphereGeometry(30, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
    map: loader.load("./img/sun_bg.jpg"),
});
const Sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(Sun);

var planets = [];





const particleSystem = initParticle();
scene.add(particleSystem);



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

let start = true;
function render() {
    Sun.rotateY(0.004);
    orbitcontrols.update();
    renderer.render(scene, camera); // 每次循环重新渲染
    if (start) {
        requestAnimationFrame(render); // 浏览器刷新率同步的循环
    }
}
// 启动动画循环
requestAnimationFrame(render);

