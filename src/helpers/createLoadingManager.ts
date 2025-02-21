import { LoadingManager } from 'three';

interface LoadingManagerOptions {
  loadingManagerEnabled: boolean;
}

export const createLoadingManager = ({ loadingManagerEnabled }: LoadingManagerOptions): LoadingManager => {
  const loadingManager = new LoadingManager();

  if (loadingManagerEnabled) {
    loadingManager.onStart = () => {
      console.log('loading started');
    };
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:');
      console.log(`${url} -> ${loaded} / ${total}`);
    };
    loadingManager.onLoad = () => {
      console.log('loaded!');
    };
    loadingManager.onError = () => {
      console.log('❌ error while loading');
    };
  }

  return loadingManager;
};
