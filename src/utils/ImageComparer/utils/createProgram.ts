export const createProgram = (gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) => {
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(`Link Program ${gl.getProgramInfoLog(program)}`)

  return program
}
