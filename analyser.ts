/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Analyser class for live audio visualisation.
 */
export class Analyser {
  private analyser: AnalyserNode;
  private bufferLength = 0;
  private dataArray: Uint8Array;

  constructor(node: AudioNode) {
    if (!node || node.context.state === 'closed') {
      this.analyser = null as unknown as AnalyserNode;
      this.dataArray = new Uint8Array(16);
      return;
    }
    this.analyser = node.context.createAnalyser();
    this.analyser.fftSize = 32;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    node.connect(this.analyser);
  }

  update() {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(this.dataArray as any);
  }

  get data() {
    return this.dataArray;
  }
}
