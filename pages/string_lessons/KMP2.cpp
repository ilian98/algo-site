void KMP (string& t, int f[]) {
    int n=t.size(),matched=0;
    for (int end=0; end<n; end++) {
        while (matched>0) {
            if (t[end]==s[matched]) break;
            matched=f[matched-1];
        }
        if (t[end]==s[matched]) {
            matched++;
            if (matched==m) { /// намерихме срещане на шаблона
                cout << end-m+2 << " ";
                matched=f[matched-1];
            }
        }
    }
    cout << endl ;
}
