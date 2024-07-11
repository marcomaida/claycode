import { Tree } from "../tree/tree.js";
import { TreeNode } from "../tree/tree_node.js";
import { assert_eq, assert_true, test_section, test_heading } from "./test_utils.js";

try {
    test_heading("Tree");

    test_section("Tree.toString");
    {
        let root = new TreeNode();
        root.children = [new TreeNode(), new TreeNode(), new TreeNode()];
        root.children[0].children = [new TreeNode(), new TreeNode()];
        root.children[2].children = [new TreeNode()];
        let tree = new Tree(root)
        assert_eq(tree.toString(), '((()())()(()))');
    }

    test_section("Tree.fromString");
    {
        let tree = Tree.fromString('(()(())(()()))')
        assert_eq(tree.root.children.length, 3);
        assert_true(tree.root.children[0].isLeaf()); // First child
        assert_eq(tree.root.children[1].children.length, 1);  // Second child
        assert_true(tree.root.children[1].children[0].isLeaf());
        assert_eq(tree.root.children[2].children.length, 2);  // Third child
        assert_true(tree.root.children[2].children[0].isLeaf());
        assert_true(tree.root.children[2].children[1].isLeaf());
    }

    test_section("Tree.toString(Tree.fromString)");
    {
        let t = `()`;
        assert_eq(TreeNode.fromString(t).toString(), t);
    }
    {
        let t = `(()())`;
        assert_eq(TreeNode.fromString(t).toString(), t);
    }
    {
        let t = `((())(()())())`;
        assert_eq(TreeNode.fromString(t).toString(), t);
    }
    {
        let t = `(()((()))()(())(()(()())))`;
        assert_eq(TreeNode.fromString(t).toString(), t);
    }

    test_section("Tree.fromString, invalid inputs");
    {
        assert_eq(TreeNode.fromString(')'), null)
        assert_eq(TreeNode.fromString('())'), null)
        assert_eq(TreeNode.fromString('((())))'), null)
        assert_eq(TreeNode.fromString('()a'), null)
        assert_eq(TreeNode.fromString('a'), null)
        assert_eq(TreeNode.fromString('(1)'), null)
        assert_eq(TreeNode.fromString(''), null)
    }



} catch (error) {
    console.error(`TEST FAILED: ${error}`);
}
