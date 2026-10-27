package com.petricho.threedays;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.view.View;
import android.view.WindowInsets;

public class MainActivity extends Activity {
    private WebView webView;
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        webView.setBackgroundColor(0xfff4f5f0);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setMixedContentMode(0);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
            @Override public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String path = request.getUrl().getPath();
                if (!"https".equals(request.getUrl().getScheme()) || !"planner.local".equals(request.getUrl().getHost())) return new android.webkit.WebResourceResponse("text/plain", "UTF-8", null);
                String file = "/".equals(path) ? "index.html" : path.substring(1);
                if (!file.matches("[a-zA-Z0-9.-]+")) return new android.webkit.WebResourceResponse("text/plain", "UTF-8", null);
                try {
                    String mime = file.endsWith(".js") ? "application/javascript" : file.endsWith(".css") ? "text/css" : "text/html";
                    return new android.webkit.WebResourceResponse(mime, "UTF-8", getAssets().open(file));
                } catch (java.io.IOException e) { return new android.webkit.WebResourceResponse("text/plain", "UTF-8", null); }
            }
        });
        setContentView(webView);
        webView.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        webView.loadUrl("https://planner.local/");
    }
    @Override protected void onResume() { super.onResume(); if(webView != null) webView.evaluateJavascript("window.refreshToday && window.refreshToday()", null); }
    @Override public void onBackPressed() { webView.evaluateJavascript("window.closeEditor && window.closeEditor()", null); }
    @Override protected void onDestroy() { if(webView != null) webView.destroy(); super.onDestroy(); }
}
