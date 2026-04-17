
interface PrintJob {
  job_id: string;
  image_url: string;
  format: string;
  width: number;
  processing_mode: string;
  created_at: number;
}

// Global variable to persist data across hot-reloads/warm invocations in Vercel
const globalStore = (globalThis as any)._printJobStore || {
  jobs: new Map<string, PrintJob>()
};

(globalThis as any)._printJobStore = globalStore;

export const addJob = (imageUrl: string) => {
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  // Process the image via weserv.nl for 1-bit dithered simulation before sending to device
  // We use the 'filt=gray' and high contrast 'con=50' to approximate binary line art
  const processedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl.replace(/^https?:\/\//, ''))}&output=png&w=576&filt=gray&con=50`;
  
  const job: PrintJob = {
    job_id: id,
    image_url: processedUrl,
    format: 'png',
    width: 576,
    processing_mode: '1-bit-dithered',
    created_at: Date.now()
  };
  globalStore.jobs.set(id, job);
  return job;
};

export const getNextJob = () => {
  // Simple FIFO
  if (globalStore.jobs.size === 0) return null;
  // Get oldest job
  const keys = Array.from(globalStore.jobs.keys());
  return globalStore.jobs.get(keys[0]);
};

export const completeJob = (id: string) => {
  return globalStore.jobs.delete(id);
};
