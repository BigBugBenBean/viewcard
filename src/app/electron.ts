if (process.env.TARGET === 'electron-renderer') {
    import('electron').then((electron) => {
        const webframes = electron.webFrame;
        webframes.setLayoutZoomLevelLimits(0, 0);
        webframes.setVisualZoomLevelLimits(1, 1);
    }).catch((reason) => console.error(reason));
}
