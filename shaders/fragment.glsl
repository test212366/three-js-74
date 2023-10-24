uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
void main() {
    vec2 st = gl_FragCoord.xy/resolution.xy;


    vec3 influencing_color_A = vec3(0.040,0.040,0.0);
    vec3 influencing_color_B = vec3(0.625,0.096,1.000);
    
    vec3 color = vec3(0.);
    
    // Background Gradient
    color = mix( influencing_color_A,
                 influencing_color_B * .25,
                 st.y);
    

  

    gl_FragColor = vec4(color,1.0);
}