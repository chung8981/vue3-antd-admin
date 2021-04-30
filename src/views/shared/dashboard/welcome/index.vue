<template>
  <div>
    <div class="box">
      <!-- <img src="~@/assets/analysis.svg"> -->
      <a-descriptions title="系统信息" bordered>
        <a-descriptions-item label="IP" key="IP">
          {{ userInfo.IP }}
        </a-descriptions-item>
        <a-descriptions-item v-for="(value, key) in browserInfo" :label="key" :key="key">
          {{ value }}
        </a-descriptions-item>
        <a-descriptions-item label="网络状态">
          <a-badge :status="online ? 'processing' : 'default'" :text="online ? '在线' : '离线'"/>
        </a-descriptions-item>
      </a-descriptions>
      <canvas></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, watchEffect} from 'vue'
import {Descriptions, Badge} from 'ant-design-vue'
import {SettingOutlined, EditOutlined, EllipsisOutlined} from '@ant-design/icons-vue';
import HuaweiCharge from '@/components/lockscreen/huawei-charge.vue'
import BrowserType from '@/utils/browser-type'
import {useBattery} from "@/hooks/useBattery";
import {useOnline} from '@/hooks/useOnline'
import {useStore} from 'vuex'
// import performanceMonitor from '@/utils/performanceMonitor'

export default defineComponent({
  name: 'welcome',
  components: {
    HuaweiCharge,
    [Badge.name]: Badge,
    [Descriptions.name]: Descriptions,
    [Descriptions.Item.name]: Descriptions.Item,
    SettingOutlined,
    EditOutlined,
    EllipsisOutlined,
  },
  setup() {
    const userInfo = useStore().getters.userInfo
    // 是否联网
    const {online} = useOnline()
    // 获取电池信息
    const {battery, batteryStatus, calcDischargingTime} = useBattery()
    // 获取浏览器信息
    const browserInfo = ref(BrowserType("zh-cn"))

    watchEffect(() => {
      Object.assign(browserInfo.value, {
        距离电池充满需要: Number.isFinite(battery.value.chargingTime) && battery.value.chargingTime != 0 ? calcDischargingTime.value : '未知',
        剩余可使用时间: Number.isFinite(battery.value.dischargingTime) && battery.value.dischargingTime != 0 ? calcDischargingTime.value : '未知',
        电池状态: batteryStatus.value,
        当前电量: battery.value.level + '%'
      })
    })
    onMounted(() => {
      const canvas = document.querySelector('canvas');
      const gl: any = (canvas as HTMLCanvasElement).getContext('webgl');
      // 着色器的GLSL程序代码
      const vertex = `
      attribute vec2 position;
      varying vec3 color;
      void main() {
          gl_PointSize = 1.0;
          color = vec3(0.5 + position * 0.5, 0.0);
          gl_Position = vec4(position*0.5, 1.0, 1.0);
      }`;
      const fragment = `
      precision mediump float;
      varying vec3 color;
      void main()
      {
          gl_FragColor = vec4(color, 1.0);
      }`;

      /*
      gl.createShader方法用于创建一个WebGLShader着色器对象，该对象可以使用
      gl.shaderSource和gl.compileShader方法配置着色器代码；
      gl.shaderSource方法用于设置WebGLShader着色器的GLSL程序代码；
      gl.compileShader方法用于编译一个GLSL着色器，使其成为二进制数据，
      然后可以被WebGLProgram对象使用；
      */
    //  if(!gl) return
      const vertexShader: any = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertex);
      gl.compileShader(vertexShader);
      const fragmentShader: any = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragment);
      gl.compileShader(fragmentShader);


      /*
      gl.createProgram方法用于创建和初始化一个 WebGLProgram 对象。
      返回值：一个 WebGLProgram 对象由两个编译过后的 WebGLShader 组成：
      顶点着色器和片段着色器（均由 GLSL 语言所写）。这些组合成一个可用的 WebGL 着色器程序。
      gl.attachShader方法负责往 WebGLProgram 添加一个片段或者顶点着色器。
      gl.linkProgram方法链接给定的WebGLProgram，从而完成为程序的片元和顶点着色器准备GPU代码的过程。
      gl.useProgram方法将定义好的WebGLProgram 对象添加到当前的渲染状态中。
      */
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
          const info = gl.getProgramInfoLog(program);
          throw new Error('Could not compile WebGL program. \n\n' + info);
      }
      gl.useProgram(program);

      /*
      gl.createBuffer方法可创建并初始化一个用于储存顶点数据或着色数据的WebGLBuffer对象
      gl.bindBuffer方法将给定的WebGLBuffer绑定到目标
      gl.bufferData方法创建并初始化了Buffer对象的数据存储区
      */
      const points = new Float32Array([ -1, -1, 0, 1, 1, -1,]);
      const bufferId = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


      /*
      gl.getAttribLocation方法返回了给定WebGLProgram对象中某属性的下标指向位置。
      gl.vertexAttribPointer方法绑定当前缓冲区范围到gl.ARRAY_BUFFER,
      成为当前顶点缓冲区对象的通用顶点属性并指定它的布局(缓冲区对象中的偏移量)。
      gl.enableVertexAttribArray方法可以打开属性数组列表中指定索引处的通用顶点属性数组。

      */
      const vPosition = gl.getAttribLocation(program, 'position'); //获取顶点着色器中的position变量的地址
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
      gl.enableVertexAttribArray(vPosition); //激活这个变量

      /*
      gl.clear(mask) 方法使用预设值来清空缓冲。
      mask参数：gl.COLOR_BUFFER_BIT   //颜色缓冲区
      gl.drawArrays()方法用于从向量数组中绘制图元。

      */ 
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, points.length/2);
    })

    // console.log(performanceMonitor.getPerformanceData(), 'performanceMonitor')

    return {
      userInfo,
      browserInfo, online,
      battery, batteryStatus, calcDischargingTime
    }
  }
})
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: calc(100vh - 190px);
  display: flex;
  flex-direction: column;

  img {
    flex: 1;
  }

  .ant-form {
    flex: 2;
  }
}
</style>
