import Image from "next/image";
import AvatarFromTwitter from "./AvatarFromTwitter";
import Icon from "./Icon";

function ParticipantCard({ data, className, key }) {
  return (
    <div
      role="listitem"
      className={`${className} xl:w-3/10 sm:w-3/4 md:w-3/10 relative mt-16 mb-32 sm:mb-24 xl:max-w-sm lg:w-3/10`}
      key={key}
    >
      <div className="rounded overflow-hidden shadow-md bg-white">
        <div className="absolute -mt-20 w-full flex justify-center">
          <div className="h-32 w-32">
            {data.profilePicture && (
              <Image
                src={data.profilePicture[0].url}
                width={118}
                height={118}
                layout="responsive"
                role="img"
                className="rounded-full object-cover h-32 w-32 shadow-md"
              />
            )}
            {!data.profilePicture && data.twitter && (
              <AvatarFromTwitter
                className="rounded-full object-cover h-32 w-32 shadow-md"
                twitterUsername={data.twitter.replace(
                  /https?:\/\/(www\.)?twitter\.com\//g,
                  ""
                )}
              />
            )}
          </div>
        </div>
        <div className="px-6 mt-16">
          <h1 className="font-bold text-3xl text-center mb-1">{data.name}</h1>
          <p className="text-gray-800 text-sm text-center">
            <a href={data.organizationWebsite}>{data.organization}</a>
          </p>
          <div className="w-full flex justify-center my-2">
            {data.categories &&
              data.categories.map((category, i) => (
                <span
                  key={`category-${category.hashtag}`}
                  className="m-1 bg-green-200 hover:bg-green-300 rounded-full px-2 text-sm leading-loose cursor-pointer"
                  title={category.name}
                >
                  #{category.hashtag}
                </span>
              ))}
          </div>
          <p className="text-center text-gray-600 text-base pt-3 font-normal">
            {data.description}
          </p>
          <div className="w-full flex justify-center my-2 flex-col">
            {data.city && (
              <div className="text-sm text-gray-600">📍 {data.city}</div>
            )}
            {data.favoriteBook && (
              <div className="text-sm text-gray-600" title="favorite book">
                📖 {data.favoriteBook}
              </div>
            )}
          </div>
          <div className="w-full flex justify-center pt-5 pb-5">
            {data.website && (
              <a href={data.website} className="mx-5">
                <Icon
                  name={
                    data.website.match(/linkedin\.com/i)
                      ? "linkedin"
                      : "website"
                  }
                />
              </a>
            )}
            <a href={data.twitter} className="mx-5">
              <Icon name="twitter" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantCard;
