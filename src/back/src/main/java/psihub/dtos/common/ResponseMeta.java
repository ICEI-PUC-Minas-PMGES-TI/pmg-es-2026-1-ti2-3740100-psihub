package psihub.dtos.common;

public record ResponseMeta(
        Integer page,
        Integer size,
        Long totalItems,
        Integer totalPages,
        Integer itemCount
) {
    public static ResponseMeta list(int itemCount) {
        return new ResponseMeta(null, null, (long) itemCount, null, itemCount);
    }
}
