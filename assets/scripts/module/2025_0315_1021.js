import { DirectionalLight, PointLight, AmbientLight, FogExp2, MeshPhongMaterial, PlaneGeometry, LinearFilter, TextureLoader, ShaderMaterial, Mesh} from 'three'

import { gsap, ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger); 

export default class Obj_1 {
  constructor(stage) {
    this.stage = stage;
		this.geo_pos = [1.7, 1.7];
    this.textureMap = {};
  }
  
  init() {
      this._clicks();
      this._setBg_base();
    }

  _clicks() {
    const buttonBox = document.querySelector('.effect_btn');
    if (!buttonBox) {
      return false;
    }
  
    let grid =  document.getElementById("gird-canvas");

    buttonBox.addEventListener('click', () => {
      if (!this.plane) {
        console.warn("テクスチャがロードされていません。操作をスキップします。");
        return;
      }     
      buttonBox.classList.toggle("effect");
      
      if( buttonBox.classList.contains('effect') == true ){
        gsap.to(grid, {
          autoAlpha: .8,
          duration: .15,
          ease: 'Power2.out',
        });
        gsap.to(this.plane.material.uniforms.u_effectMix, {
          value: 1.0,
        duration: 3.0, // ゆっくり変化させる
        ease: 'sine.inOut',
              });        
        gsap.to(this.plane.material.uniforms.u_vignette, {
            value: 1.5,
            duration: 2.5,
        });
        gsap.to(this.plane.material.uniforms.u_grainStrength, { 
            value: 2.5, 
           duration: 3.0, // ゆっくり変化させる
            ease: 'sine.inOut',
        }); 
        gsap.to(this.plane.material.uniforms.u_brightness, {
            value: 0.95,
            duration: 2.0,
        });
        

      } else {
          gsap.to(grid, {
            autoAlpha: 0,
            duration: .25,
            ease: 'Power2.out',
          });
          //
gsap.to(grid, { autoAlpha: 0, duration: 0.5 });
        
        gsap.to(this.plane.material.uniforms.u_effectMix, {
            value: 0.0,
            duration: 0.5,
        });
        gsap.to(this.plane.material.uniforms.u_vignette, {
            value: 0.0,
            duration: 0.5,
        });
        gsap.to(this.plane.material.uniforms.u_grainStrength, {
            value: 0.0,
            duration: 0.5
        });
        gsap.to(this.plane.material.uniforms.u_brightness, {
            value: 1.0,
            duration: 0.5,
        });  
          }
    });    

  }
  _setBg_base(){
    let self = this;
    
    this.light = new AmbientLight(0xffffff, 1.0)
    this.stage.scene.add(this.light);
        
    this.textureMap = new TextureLoader().load('../images/2025_0315_1021.png',
    (tex) => { 
    let h = (window.innerWidth / window.innerHeight);
    let w =  tex.image.width / (tex.image.height / h);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearFilter;
    this.textureMap = tex;
    
    // 平面
    const geometry = new PlaneGeometry(3, 3);
    
    const shaderMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: { value: this.textureMap },
            u_effectMix: { value: 0.0 },
            u_grainStrength: { value: 0.0 },
            u_brightness: { value: 1.0 },
            u_vignette: { value: 0.0 }
                },
      vertexShader: document.querySelector('#v-shader').textContent,
      fragmentShader: document.querySelector('#f-shader').textContent,
      transparent: true,
  });
  
    self.plane = new Mesh( geometry, shaderMaterial );
    self.plane.position.set(0, 0, -3);
    self.plane.scale.set(w, h, 1);
    self.plane.renderOrder = 0;

    this.stage.scene.add( self.plane );
  
});
}

  onResize() {
    const tex = this.textureMap;
    if ( tex.image ) {
      let h = (window.innerWidth / window.innerHeight);
      let w =  tex.image.width / (tex.image.height / h);
      this.plane.scale.set(w, h, 1);
    }      
  }

  onRaf() {
  }
}