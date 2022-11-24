import { Button, Drawer } from "antd";
import { useReduxDispatch, useReduxSelector } from "../../utils/hooks/useRedux";
import { projectActions } from "../../store/reducers/projectSlice";

const ProjectModal: React.FC = () => {
    const dispatch = useReduxDispatch();
    const isModalOpened = useReduxSelector((s) => s.project.isModalOpened);
    return (
        <Drawer
            open={isModalOpened}
            onClose={() => dispatch(projectActions.closeModal())}
            width={"100%"}
        >
            <h1>Project Modal</h1>
            <Button onClick={() => dispatch(projectActions.closeModal())}>
                Close
            </Button>
        </Drawer>
    );
};

export default ProjectModal;
