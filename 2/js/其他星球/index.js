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
const sunGeo = new THREE.SphereGeometry(14, 30, 30);
const sunMat = new THREE.MeshBasicMaterial({
  map: loader.load("./img/sun_bg.jpg"),
});
const Sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(Sun);

var planets = [];

//添加水星
const Mercury = loadPlanet("mercury", 2, 20, 0.02, 0.002);
planets.push(Mercury);
//添加金星
const Venus = loadPlanet("venus", 4, 30, 0.012, 0.002);
planets.push(Venus);
//添加地球
const Earth = loadPlanet("earth", 5, 40, 0.01, 0.002);
planets.push(Earth);
//添加火星
const Mars = loadPlanet("mars", 4, 50, 0.008, 0.002);
planets.push(Mars);
//添加木星
const Jupiter = loadPlanet("jupiter", 9, 70, 0.006, 0.002);
planets.push(Jupiter);
//添加土星
const Saturn = loadPlanet("saturn", 7, 100, 0.002, 0.01);
planets.push(Saturn);
//添加天王星
const Uranus = loadPlanet("uranus", 4, 120, 0.003, 0.002);
planets.push(Uranus);
//添加海王星
const Neptune = loadPlanet("neptune", 3, 150, 0.001, 0.008);
planets.push(Neptune);
//添加冥王星
const Pluto = loadPlanet("pluto", 4, 160, 0.0016, 0.012);
planets.push(Pluto);

const particleSystem = initParticle();
scene.add(particleSystem);

/**
 *
 * 加载行星（带轨道、标签、公转容器、土星环）
 * @param {string} name - 行星英文名称（mercury/saturn等）
 * @param {number} radius - 行星半径
 * @param {number} position - 公转轨道半径
 * @param {number} speed - 公转速度（值越小越慢）
 * @param {number} rotation - 自转速度（值越小越慢）
 * @returns {THREE.Object3D} 行星公转容器 * 加载行星（带轨道、标签、公转容器、土星环）
 */
function loadPlanet(name, radius, position, speed, rotationSpeed) {
  // 初始化其他星球
  const planetNameMap = {
    mercury: "水星",
    venus: "金星",
    earth: "地球",
    mars: "火星",
    jupiter: "木星",
    saturn: "土星",
    uranus: "天王星",
    neptune: "海王星",
  };
  // 水星
  // 创建太阳网格：球体几何体（半径14，横向分段30，纵向分段30）+ 材质
  const mercuryGeo = new THREE.SphereGeometry(radius, 30, 30);
  const planetMat = new THREE.MeshBasicMaterial({
    map: loader.load(`./img/${name}_bg.jpg`),
  });
  const planet = new THREE.Mesh(mercuryGeo, planetMat);
  planet.position.z = -position;

  const planetSystem = new THREE.Object3D();
  planetSystem.add(planet);
  planetSystem.speed = speed;
  planetSystem.rotationSpeed = rotationSpeed;

  Sun.add(planetSystem);

  if (name === "saturn") {
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

  return planetSystem;
}

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

//初始化射线检测器
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

//监听鼠标点击事件
canvas.addEventListener('click', onCanvasClick, false)
function onCanvasClick(e) {
  //1.将鼠标坐标为标准化设备坐标（-1 到1）

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = (e.clientY / window.innerHeight) * 2 + 1
  console.log(mouse.x, mousey);
  //2.更新射线
  raycaster.setFromCamera(mouse, camera)
  //3.批量检测所有可点击行星
  const intersects = raycaster.intersect0bjects(e, true);
  //4.c处理命中结果
  if (intersects, length > 0) {
    //获取第一个命中的行星Mesh(最外层的行星本体)
    let targetPlanet = intersects[0].Object;
    //匹配跳转配置
    const planetConfig = planetJumpConfig[targetPlanet.name]
    console.log(targetPlanet.name)
    if (planetConfig) {
      console.log('点击了${planetConfig.name},跳转到：${planetConfig.url');
      //跳转页面（可替换为window.open 新窗口打开）
      window.location.href = "./" + targetPlanet.name + ".html";

    }


  }


}

let start = true;
function render() {
  Sun.rotateY(0.004);

  for (var i = 0; i < planets.length; i++) {
    planets[i].rotateY(planets[i].speed);
    // planets[i].children[0].rotateY(planets[i].rotationSpeed);
  }
  // orbitcontrols.update();
  renderer.render(scene, camera); // 每次循环重新渲染

  if (start) {
    requestAnimationFrame(render); // 浏览器刷新率同步的循环
  }
}
// 启动动画循环
requestAnimationFrame(render);

// const but1 = document.getElementById("but1");
// const but2 = document.getElementById("but2");
// const but3 = document.getElementById("but3");
// const but4 = document.getElementById("but4");
// but1.addEventListener("click", () => {
//   start = false;
// });
// but2.addEventListener("click", () => {
//   start = true;
//   render();
// });
// but3.addEventListener("click", () => {
//   for (var i = 0; i < planets.length; i++) {
//     planets[i].rotation.y = 0;
//     planets[i].children[0].rotation.y = 0;
//   }
// });

// but4.addEventListener("click", () => {});
