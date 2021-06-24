int cnt=0;
for (int vr=1; vr<=n; vr++) {
    if (visited[vr]==false) {
        cnt++;
        dfs(vr);
    }
}