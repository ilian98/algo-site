int find_cnt (int ind, int l, int r, int ql, int qr) {
    if ((ql<=l)&&(r<=qr)) {
        return tree[ind].cnt;
    }
    int mid=(l+r)/2,cnt=0;
    if ((ql<=mid)&&(tree[ind].l!=0)) cnt+=find_cnt(tree[ind].l,l,mid,ql,qr); // отиваме в лявото дете само ако го има
    if ((qr>mid)&&(tree[ind].r!=0)) cnt+=find_cnt(tree[ind].r,mid+1,r,ql,qr); // отиваме в дясното дете само ако го има
    return cnt;
}