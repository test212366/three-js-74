uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;
void main() {
    
    
	vec4 ttt = texture2D(texture1, gl_PointCoord);
	
	
	float radius = 0.3;

	vec2 cent = gl_PointCoord - vec2(.5);


	if(dot(cent, cent) > radius * radius ) discard;
    gl_FragColor = vec4(vec3(ttt), 1.);
 
   
}