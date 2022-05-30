import { Upvote } from './../entities/Upvote';
import { User } from './../entities/User';
import DataLoader from 'dataloader';
const badGetUsers = async (userIds: number[]) => {
    const user = await User.findByIds(userIds)
    return userIds.map(userId => user.find(user => user.id === userId))
}

interface VoteTypeConditions {
    postId: number;
    userId: number;
}

const badGetVoteTypes = async (voteTypeConditions: VoteTypeConditions[]) => {
    const voteTypes = await Upvote.findByIds(voteTypeConditions);
    return voteTypeConditions.map(voteTypeCondition => voteTypes.find(voteType =>
        voteType.postId === voteTypeCondition.postId && voteType.userId === voteTypeCondition.userId))
}

export const buildDataLoaders = () => ({
    userLoader: new DataLoader<number, User | undefined>(userIds => badGetUsers(userIds as number[])),
    voteTypeLoader: new DataLoader<VoteTypeConditions,
        Upvote | undefined>(voteTypes => badGetVoteTypes(voteTypes as VoteTypeConditions[])),
})