import { useSelector } from 'react-redux';

const usePermissions = (moduleName) => {
    const { user } = useSelector((state) => state.auth);

    const actions = user?.permissions.reduce((acc, perm) => {
        const [action, module] = perm.split('_');
        if (module === moduleName || action === 'all') {
            acc.push(action);
        }
        return acc;
    }, []);

    const canCreate = actions.includes('create') || actions.includes('all');
    const canDelete = actions.includes('delete') || actions.includes('all');
    const canEdit = actions.includes('update') || actions.includes('all');

    return { canCreate, canDelete, canEdit };
};

export default usePermissions;
