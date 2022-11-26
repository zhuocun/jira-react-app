import { Button, Drawer } from "antd";
import useProjectModal from "../../utils/hooks/useProjectModal";

const ProjectModal: React.FC = () => {
    const { isModalOpened, closeModal } = useProjectModal();
    return (
        <Drawer open={isModalOpened} onClose={closeModal} width={"100%"}>
            <h1>Project Modal</h1>
            <Button onClick={closeModal}>Close</Button>
        </Drawer>
    );
};

export default ProjectModal;
