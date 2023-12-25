import styled from "@emotion/styled";
import { Button, Drawer, Form, Input, Select, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { observer } from "mobx-react";
import { useEffect } from "react";

import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import useReactQuery from "../../utils/hooks/useReactQuery";
import ErrorBox from "../errorBox";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 80vh;
    justify-content: center;
`;

const ProjectModal: React.FC = observer(() => {
    const { isModalOpened, closeModal, editingProject, isLoading } =
        useProjectModal();

    const {
        mutateAsync,
        error,
        isLoading: mutateLoading
    } = editingProject
        ? useReactMutation("projects", "PUT")
        : useReactMutation("projects", "POST");

    const [form] = useForm();
    const onClose = () => {
        closeModal();
        form.resetFields();
    };
    const onFinish = (input: {
        projectName: string;
        organization: string;
        managerId: string;
    }) => {
        mutateAsync({ ...editingProject, ...input }).then(onClose);
    };
    const modalTitle = editingProject ? "Edit Project" : "Create Project";

    useEffect(() => {
        form.setFieldsValue(editingProject);
    }, [editingProject, form]);

    // const members = useQueryClient().getQueryData<IMember[]>("users/members");
    const { data: members } = useReactQuery<IMember[]>("users/members");
    return (
        <Drawer forceRender open={isModalOpened} onClose={onClose} width="100%">
            <Container>
                {isLoading ? (
                    <Spin />
                ) : (
                    <>
                        <h1>{modalTitle}</h1>
                        <ErrorBox error={error} />
                        <Form
                            form={form}
                            layout="vertical"
                            style={{ width: "40rem" }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Project Name"
                                name="projectName"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the project name"
                                    }
                                ]}
                            >
                                <Input placeholder="Project Name" />
                            </Form.Item>
                            <Form.Item
                                label="Organization"
                                name="organization"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the organization"
                                    }
                                ]}
                            >
                                <Input placeholder="Organization" />
                            </Form.Item>
                            <Form.Item
                                label="Manager"
                                name="managerId"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a manager"
                                    }
                                ]}
                            >
                                <Select placeholder="Managers">
                                    {members?.map((member) => (
                                        <Select.Option
                                            value={member._id}
                                            key={member._id}
                                        >
                                            {member.username ?? "...loading"}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item style={{ textAlign: "center" }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={mutateLoading}
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Container>
        </Drawer>
    );
});

export default ProjectModal;
