package com.akipasa.duermo;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class NavigationPolicyTest {
    @Test
    public void internalNavigationRequiresHttpsAndExactHost() {
        assertTrue(NavigationPolicy.isInternal("https://akiduermo.com//events/sample"));
        assertTrue(NavigationPolicy.isInternal("https://www.akiduermo.com/en"));
        assertFalse(NavigationPolicy.isInternal("http://akiduermo.com/es"));
        assertFalse(NavigationPolicy.isInternal("https://akiduermo.com.evil.example/es"));
    }

    @Test
    public void externalNavigationRejectsExecutableAndUnknownSchemes() {
        assertTrue(NavigationPolicy.canOpenExternally("mailto:hola@example.com"));
        assertTrue(NavigationPolicy.canOpenExternally("https://checkout.stripe.com/sample"));
        assertFalse(NavigationPolicy.canOpenExternally("javascript:alert(1)"));
        assertFalse(NavigationPolicy.canOpenExternally("file:///data/local/tmp/sample"));
        assertFalse(NavigationPolicy.canOpenExternally("intent://unsafe"));
    }

    @Test
    public void downloadsAreLimitedToOwnedAndStorageHosts() {
        assertTrue(NavigationPolicy.canDownload("https://akiduermo.com//account/export"));
        assertTrue(NavigationPolicy.canDownload("https://project.supabase.co/storage/object"));
        assertFalse(NavigationPolicy.canDownload("https://evil.example/payload.apk"));
        assertFalse(NavigationPolicy.canDownload("data:text/plain,secret"));
    }
    @Test
    public void nativeOAuthCallbackIsStrictlyScopedToTheApp() {
        assertTrue(NavigationPolicy.appCallbackUrl("akiduermo://auth/callback?locale=en&code=test") != null);
        assertTrue(NavigationPolicy.appCallbackUrl("akiduermo://auth/callback?locale=es&error=denied") != null);
        assertFalse(NavigationPolicy.appCallbackUrl("akiduermo://wrong/callback?code=test") != null);
        assertFalse(NavigationPolicy.appCallbackUrl("akiduermo://auth/other?code=test") != null);
        assertFalse(NavigationPolicy.appCallbackUrl("akiduermo://auth/callback#token") != null);
        assertFalse(NavigationPolicy.appCallbackUrl("https://evil.example/auth/callback?code=test") != null);
    }
}
