int a[MAXN+1],tree[4*MAXN];
void build_tree (int ind, int l, int r) {
    if (l==r) { // стигнали сме листо
       tree[ind]=a[l];
       return ;
    }
    int mid=(l+r)/2;
    build_tree(2*ind,l,mid);
    build_tree(2*ind+1,mid+1,r);
    tree[ind]=tree[2*ind]+tree[2*ind+1];
}